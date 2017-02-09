<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use app\models\TableBox;
use \yii\db\ActiveRecord;
use app\components\TableBehavior;

/**
 * This is the model class for table "rc_table".
 *
 * @property integer $id
 * @property integer $rows
 * @property integer $cols
 * @property integer $element_id
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Element $element
 * @property TableBox[] $tableBoxes
 */
class Table extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'rc_table';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['element_id'], 'required'],
            [['rows', 'cols', 'element_id', 'created_at', 'updated_at'], 'integer'],
            [['element_id'], 'exist', 'skipOnError' => true, 'targetClass' => Element::className(), 'targetAttribute' => ['element_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'rows' => 'Rows',
            'cols' => 'Cols',
            'element_id' => 'Element ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'updated_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['updated_at'],
                ],
                // if you're using datetime instead of UNIX timestamp:
                // 'value' => new Expression('NOW()'),
            ]
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getElement()
    {
        return $this->hasOne(Element::className(), ['id' => 'element_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTableBoxes()
    {
        return $this->hasMany(TableBox::className(), ['table_id' => 'id']);
    }

    /**
     * Load and create all relations models from an array representing the Table
     *
     * @return true if success else false
     */
    public function loadFromData($data, $element)
    {
        $this->element_id = $element->id;
        $this->rows = $data['rows'];
        $this->cols = $data['cols'];

        if (!$this->validate()) {
            return $this->errors;
        }

        $this->save();

        $boxes = $this->getTableBoxes()->all();
        // sort by coords in double entry tab
        $sortedBoxes = [];
        foreach($boxes as $box) {
            $sortedBoxes[$box->x][$box->y] = $box;
        }

        if (!empty($data['cases'])) {
            foreach($data['cases'] as $x => $dataBox1) {
                foreach($dataBox1 as $y => $dataBox2) {
                     if (empty($sortedBoxes[$x][$y])) {
                        $box = new TableBox();
                    } else {
                        $box = $sortedBoxes[$x][$y];
                    }
                    $dataBox2['x'] = $x;
                    $dataBox2['y'] = $y;
                    $error = $box->loadFromData($dataBox2, $this);
                    if ($error) {
                        return $error;
                    }
                }
            }
            return 0;
        } 
    }

    public function getFormatedTableBoxes($reverse = true)
    {
        $boxes = $this->getTableBoxes()->all();
        $ret = [];
        if ($reverse) {
            foreach($boxes as $box) {
                $ret[$box->y][$box->x] = $box;
            }
        } else {
            foreach($boxes as $box) {
                $ret[$box->x][$box->y] = $box;
            }
        }
        
        return $ret;
    }
}