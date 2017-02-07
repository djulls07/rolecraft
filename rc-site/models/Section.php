<?php

namespace app\models;

use Yii;
use app\models\Element;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use app\components\SectionBehavior;

/**
 * This is the model class for table "rc_section".
 *
 * @property integer $id
 * @property integer $modelsheet_id
 * @property integer $created_at
 * @property integer $updated_at
 * @property string $name
 * @property integer $position
 * @property int $is_separator
 * @property integer $size
 * @property string $search_id
 *
 * @property Element[] $elements
 * @property Modelsheet $modelsheet
 */
class Section extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'rc_section';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['modelsheet_id'], 'required'],
            [['modelsheet_id', 'created_at', 'updated_at', 'size', 'is_separator'], 'integer'],
            [['name', 'search_id'], 'string', 'max' => 45],
            [['modelsheet_id'], 'exist', 'skipOnError' => true, 'targetClass' => Modelsheet::className(), 'targetAttribute' => ['modelsheet_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'modelsheet_id' => 'Modelsheet ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'name' => 'Name',
            'is_separator' => 'Is Separator',
            'size' => 'Size',
            'search_id' => 'Search ID',
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
    public function getElements()
    {
        return $this->hasMany(Element::className(), ['section_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getModelsheet()
    {
        return $this->hasOne(Modelsheet::className(), ['id' => 'modelsheet_id']);
    }

    // IMPORTS

    /**
     * Load and create all relations models from an array representing the Section
     *
     * @return errors if failed 0 else
     */
    public function loadFromData($data, $position, $modelsheet)
    {
        $this->modelsheet_id = $modelsheet->id;
        $this->position = $position;
        $this->name = $data['name'] ? $data['name'] : '';
        $this->is_separator = (isset($data['isSeparator']) && $data['isSeparator']) ? 1 : 0;
        $this->size = $data['size'];
        $this->search_id = $data['id'];

        if (!$this->validate()) {
            return $this->errors;
        }

        $this->save();

        $elements = $this->getElements()->all();

        foreach($data['elements'] as $index => $elementData) {
            if (empty($elements[$index])) {
                $element = new Element();
            } else {
                $element = $elements[$index];
            }
            $error = $element->loadFromData($elementData, $this);
            if ($error) {
                return $error;
            }
        }
        return 0;
    }
}