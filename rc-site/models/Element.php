<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use app\models\Table;
use \yii\db\ActiveRecord;

/**
 * This is the model class for table "rc_element".
 *
 * @property integer $id
 * @property integer $section_id
 * @property string $label
 * @property string $search_id
 * @property string $type
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Section $section
 * @property Table[] $tables
 */
class Element extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'rc_element';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['section_id', 'type'], 'required'],
            [['section_id', 'created_at', 'updated_at'], 'integer'],
            [['label', 'search_id'], 'string', 'max' => 45],
            [['type'], 'string', 'max' => 255],
            [['section_id'], 'exist', 'skipOnError' => true, 'targetClass' => Section::className(), 'targetAttribute' => ['section_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'section_id' => 'Section ID',
            'label' => 'Label',
            'search_id' => 'Search ID',
            'type' => 'Type',
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
    public function getSection()
    {
        return $this->hasOne(Section::className(), ['id' => 'section_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTables()
    {
        return $this->hasMany(Table::className(), ['element_id' => 'id']);
    }

    //IMPORTS

    /**
     * Load and create all relations models from an array representing the Element
     *
     * @return true if success else false
     */
    public function loadFromData($data, $section)
    {
        $this->section_id = $section->id;
        $this->label = $data['label'];
        $this->search_id = $data['id'];
        $this->type = $data['type'];

        if (!$this->validate()) {
            return $this->errors;
        }

        $this->save(); // get ID

        if (isset($data['table'])) {
            $table = $this->getTables()->one(); // only one even if hasMany previous app dont now that.
            if (!$table) {
                $table = new Table();
            }
            $error = $table->loadFromData($data['table'], $this);
            if ($error) {
                return $error;
            }
        }
        return 0;
    }
}