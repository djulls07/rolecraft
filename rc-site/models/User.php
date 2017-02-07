<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use app\components\SyncBehavior;
use app\models\Modelsheet;

class User extends ActiveRecord implements \yii\web\IdentityInterface
{
    public $plainPassword;

    public static function tableName()
    {
        return 'rc_user';
    }

    /**
     * @return relation with Modelsheet
     */
    public function getModelsheets()
    {
        return $this->hasMany(Modelsheet::className(), ['user_id' => 'id']);
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
            'sync' => [
                'class' => SyncBehavior::className(),
                'collectionName' => 'users',
                'fields' => ['username' => 'username', 'plainPassword' => 'plainPassword']
            ],
        ];
    }

    /**
     * Finds an identity by the given ID.
     *
     * @param string|int $id the ID to be looked for
     * @return IdentityInterface|null the identity object that matches the given ID.
     */
    public static function findIdentity($id)
    {
        return static::findOne($id);
    }

    public static function findByUsername($username)
    {
        return static::findOne(array('username' => $username));
    }

    /**
     * Finds an identity by the given token.
     *
     * @param string $token the token to be looked for
     * @return IdentityInterface|null the identity object that matches the given token.
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        return static::findOne(['access_token' => $token]);
    }

    /**
     * @return int|string current user ID
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string current user auth key
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @param string $authKey
     * @return bool if auth key is valid for current user
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    public function validatePassword($password)
    {
        $hash = $this->password;
        if (Yii::$app->getSecurity()->validatePassword($password, $hash)) {
            return true;
        }
        return false;
    }


}
