<?php

namespace app\components;

use Yii;
use yii\db\ActiveRecord;
use yii\base\Behavior;
use yii\helpers\VarDumper;

class SyncModelsheetBehavior extends Behavior
{
    
    public function events()
    {
        return [
            ActiveRecord::EVENT_BEFORE_UPDATE => 'sync',
            ActiveRecord::EVENT_BEFORE_INSERT => 'sync',
        ];
    }

    protected function constructDataArray()
    {
        $model = $this->owner;

        $data = [];

        // inject username for meteor to find user & associate him to the sheet
        $data['username'] = Yii::$app->user->identity->username;
        // get mongo_user_id
        $data['owner'] = Yii::$app->mongodb->getCollection('rc_users')->findOne(['username' => $data['username']])['_id'];

        $data['name'] = $model->name;
        $data['language'] = $model->language;
        $data['private'] = $model->private ? true : false;
        $data['sections'] = [];
        //$data['updatedAt'] = date("r", $model->updated_at);
        $sections = $model->getSections()->orderBy('position')->all();
        foreach($sections as $k1 => $section) {
            $data['sections'][$k1]['id'] = $section->search_id;
            $data['sections'][$k1]['isSeparator'] = $section->is_separator ? true : false;
            $data['sections'][$k1]['name'] = $section->name;
            $data['sections'][$k1]['position'] = $section->position;
            $data['sections'][$k1]['size'] = $section->size;

            $elements = $section->getElements()->all();
            foreach($elements as $k2 => $element) {
                $data['sections'][$k1]['elements'][$k2]['id'] = $element->search_id;
                $data['sections'][$k1]['elements'][$k2]['label'] = $element->label;
                $data['sections'][$k1]['elements'][$k2]['type'] = $element->type;

                $table = $element->getTables()->one(); // can only have one in playing app
                if ($table) {
                    $data['sections'][$k1]['elements'][$k2]['table']['rows'] = $table->rows;
                    $data['sections'][$k1]['elements'][$k2]['table']['cols'] = $table->cols;

                    $boxes = $table->getTableBoxes()->all();
                    $cases = [];
                    foreach($boxes as $box) {
                        $cases['' . $box->x]['' . $box->y] = [];
                        if (!empty($box->label)) {
                            $cases[''.$box->x][''.$box->y]['label'] = $box->label;
                        }
                    }
                    $data['sections'][$k1]['elements'][$k2]['table']['cases'] = $cases;
                }
            }
        }
        return $data;
    }

    
    public function syncOld($event)
    {
        $model = $this->owner;
        $data = $this->constructDataArray();

        // mongo collection
        $collection = Yii::$app->mongodb->getCollection('modelsheets');
        
        if (isset($model->mongo_id)) {
            $data['_id'] = $model->mongo_id;
            $collection->save($data);
        } else {
            $mongoId = $collection->insert($data);
            $model->mongo_id = (string) $mongoId;
        }
    }

    /**
     * Synchronize the 2 databases by calling meteor collection api
     * And keep the mongo_id reference in current db
     *
     * @return string
     */
    public function sync($event)
    {   
        // re order positions
        $sections = $this->owner->getSections()->orderBy('position')->all();
        foreach($sections as $index => $s) {
            $s->position = $index;
            $s->save();
        }

        $data = $this->constructDataArray();
        
        $headers = array();
        $headers[] = "x-auth-token: mysuperkeyquikillquiosekickkill";
        $headers[] = 'Content-Type: application/json';                                                                     
        
        $state_ch = curl_init();
        if (!$this->owner->mongo_id) {
            // create
            $data_string = json_encode($data);
            $headers[] = 'Content-Length: ' . strlen($data_string);
            curl_setopt($state_ch, CURLOPT_URL,"localhost:3000/collectionapi/modelsheets");
            curl_setopt($state_ch, CURLOPT_POST, 1);
            curl_setopt($state_ch, CURLOPT_POSTFIELDS, $data_string);
            curl_setopt($state_ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($state_ch, CURLOPT_HTTPHEADER, $headers);
            $state_result = curl_exec ($state_ch);
            $state_result = json_decode($state_result, true);
            $mongoId = $state_result[0]['_id'];
            $this->owner->mongo_id = $mongoId;
            return $state_result;
        } else {
            // create
            $req = ['$set' => [
                'sections' => $data['sections'],
                'name' => $data['name'],
                'private' => $data['private']
            ]];
            $data_string = json_encode($req);

            $headers[] = 'Content-Length: ' . strlen($data_string);
            curl_setopt($state_ch, CURLOPT_URL,"localhost:3000/collectionapi/modelsheets/" . $this->owner->mongo_id);
            curl_setopt($state_ch, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($state_ch, CURLOPT_HEADER, false);
            curl_setopt($state_ch, CURLOPT_POSTFIELDS, $data_string);
            curl_setopt($state_ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($state_ch, CURLOPT_HTTPHEADER, $headers);
            $state_result = curl_exec ($state_ch);
            $state_result = json_decode($state_result, true);
            return $state_result;
        }
    }
}