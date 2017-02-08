<?php

namespace app\models;

use Yii;
use app\models\Section;
use yii\behaviors\TimestampBehavior;
use \yii\db\ActiveRecord;
use app\components\SyncModelsheetBehavior;

/**
 * This is the model class for table "rc_modelsheet".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property integer $private
 * @property string $language
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property User $user
 * @property Section[] $sections
 * @property mongo_id
 */
class Modelsheet extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'rc_modelsheet';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'name', 'language'], 'required'],
            [['user_id', 'private', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 255, 'min' => '4'],
            [['language'], 'string', 'max' => 45],
            [['name'], 'unique'],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::className(), 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'name' => 'Name',
            'private' => 'Private',
            'language' => 'Language',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'mongo_id' => 'Mongo ID'
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
            ],
            'sync_meteor_app' => [
                'class' => SyncModelsheetBehavior::className()            ],
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSections()
    {
        return $this->hasMany(Section::className(), ['modelsheet_id' => 'id']);
    }

    // QUERIES..

    /**
	 * @return query to get all public model sheets
     */
	public static function getPublics()
	{
		return static::find()->where(['private' => 0]);
	}

    /**
	 * @return query to get all model sheets (user + public ones)
     */
	public static function getAll()
	{
		return static::find()
			->where(['user_id' => \Yii::$app->user->identity->id])
			->orWhere(['private' => 0]);
	}

	public static function findByName($name)
	{
		return static::findOne(['name' => $name]);
	}


	// IMPORTS FROM FILE(S)

	/**
	 * Load and create all relations models from an array representing the Modelsheet ( import json decoded from rc-app )
	 *
	 * @return true if success else false
     */
	public function loadFromData($data)
	{
		if (!Yii::$app->user->identity) {
			return ['Not-Auth'];
		}
		// we need to maj sections essentially
		$this->name = $data['name'];
		$this->language = $data['language'];
		$this->private = $data['private'] ? 1 : 0;
		$this->user_id = Yii::$app->user->identity->id;

		if (!$this->validate()) {
			return $this->errors;
		}

		$this->save();

		$sections = $this->getSections()->orderBy('position')->all();

		// sections are ordered in json data
		foreach($data['sections'] as $index => $sectionData) {
			if (empty($sections[$index])) {
				$section = new Section();
			} else {
				$section = $sections[$index];
			}
			$error = $section->loadFromData($sectionData, $index, $this);
			if ($error) {
				return $error;
			}
		}
		$this->save();
		return 0;
	}
}