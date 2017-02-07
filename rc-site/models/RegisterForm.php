<?php

namespace app\models;

use Yii;
use yii\base\Model;

/**
 * LoginForm is the model behind the login form.
 *
 * @property User|null $user This property is read-only.
 *
 */
class RegisterForm extends Model
{
    public $username;
    public $plainPassword;

    private $_user = false;

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            [['username', 'plainPassword'], 'required'],
            ['plainPassword', 'validatePassword'],
            ['username', 'unique', 'targetAttribute' => 'username', 'targetClass' => 'app\models\User']
        ];
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     */
    public function validatePassword($attribute, $params)
    {
        return true;
    }

    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = User::findByUsername($this->username);
        }

        return $this->_user;
    }

    public function register()
    {
        if ($this->validate()) {
            if (! $this->getUser()) {
                $user = new User();
                $user->username = $this->username;
                $hash = Yii::$app->getSecurity()->generatePasswordHash($this->plainPassword);
                $user->password = $hash;
                $user->plainPassword = $this->plainPassword;
                $user->save();
                // login
                Yii::$app->user->login($user, 0);
                return true;
            }
        }
        return false;
    }
}
