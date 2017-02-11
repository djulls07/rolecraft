<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use \yii\db\ActiveRecord;

/**
 * This is the model class for table "rc_table_box".
 *
 * @property integer $id
 * @property string $label
 * @property integer $table_id
 * @property integer $created_at
 * @property integer $updated_at
 * @property integer $x
 * @property integer $y
 *
 * @property Table $table
 */
class TableBox extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'rc_table_box';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['table_id', 'created_at', 'updated_at', 'x', 'y'], 'integer'],
            [['label'], 'string', 'max' => 255],
            [['table_id'], 'exist', 'skipOnError' => true, 'targetClass' => Table::className(), 'targetAttribute' => ['table_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'label' => 'Label',
            'table_id' => 'Table ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'x' => 'X',
            'y' => 'Y',
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
    public function getTable()
    {
        return $this->hasOne(Table::className(), ['id' => 'table_id']);
    }

    /**
     * Load and create all relations models from an array representing the TableBox
     *
     * @return true if success else false
     */
    public function loadFromData($data, $table)
    {
        $this->table_id = $table->id;
        $this->label = isset($data['label']) ? $data['label'] : null;
        $this->x = (int) $data['y'];
        $this->y = (int) $data['x'];
        if (!$this->validate()) {
            return $this->errors;
        }
        $this->save();
        return 0;
    }
}