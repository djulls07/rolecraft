<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\TableBox;

class TableboxController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['updatefield'],
                'rules' => [
                    [
                        'actions' => ['updatefield'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ]
        ];
    }

    /**
     * Handle ajax request to update one field of one TableBox
     */
    public function actionUpdatefield($id, $field)
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isAjax) {
            $value = $request->getBodyParam($field);
            $box = TableBox::findOne($id);
            $box->$field = $value;
            if ($box->validate()) {
                $box->save();
                return ['status' => 0, 'message' => 'success'];
            }
            return ['status' => -1, 'message' => 'Error'];
        }
        return ['status' => -2];
    }
}