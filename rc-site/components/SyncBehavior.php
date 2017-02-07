<?php

namespace app\components;

use yii\db\ActiveRecord;
use yii\base\Behavior;
use yii\helpers\VarDumper;

class SyncBehavior extends Behavior
{
    
    public $collectionName;
    public $fields;

    public function events()
    {
        return [
            ActiveRecord::EVENT_BEFORE_UPDATE => 'sync',
            ActiveRecord::EVENT_BEFORE_INSERT => 'sync',
        ];
    }

    protected function constructDataArray()
    {
        $owner = $this->owner;
        $data = [];
        foreach($this->fields as $k => $f) {
            $val = $owner->$k;
            $tmp = explode(".", $f);
            $aux = &$data;
            foreach($tmp as $t) {
                $aux[$t] = [];
                $aux = &$aux[$t];
            }
            $aux = $val;
        }
        return $data;
    }

    public function sync($event)
    {
        $data = $this->constructDataArray();
        
        $data_string = json_encode($data);

        $headers = array();
        $headers[] = "x-auth-token: mysuperkeyquikillquiosekickkill";
        $headers[] = 'Content-Type: application/json';                                                                     
        $headers[] = 'Content-Length: ' . strlen($data_string);
        $state_ch = curl_init();
        if (!$this->owner->id) {
            // create
            curl_setopt($state_ch, CURLOPT_URL,"localhost:3000/collectionapi/" . $this->collectionName);
            curl_setopt($state_ch, CURLOPT_POST, 1);
            curl_setopt($state_ch, CURLOPT_POSTFIELDS, $data_string);
            curl_setopt($state_ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($state_ch, CURLOPT_HTTPHEADER, $headers);
            $state_result = curl_exec ($state_ch);
            $state_result = json_decode($state_result, true);
            return $state_result;
        } else {
            //update
        }
    }
}