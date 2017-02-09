<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Table;

class TableController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['removeLine'],
                'rules' => [
                    [
                        'actions' => ['removeLine'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ]
        ];
    }

    public function actionRemoveline($id, $lineN)
    {
        $table = Table::findOne($id);

        if (!$table) {
            throw new \yii\web\HttpException(404, 'Table Not found');
        }
        $modelsheet = $table
        ->getElement()
        ->one()
        ->getSection()
        ->one()
        ->getModelsheet()
        ->one();

        if (Yii::$app->user->identity->id != $modelsheet->user_id) {
            throw new \yii\web\HttpException(401, 'Not authorized');
        }

        $tablesBoxes = $table->getFormatedTableBoxes(false);
        foreach($tablesBoxes[(int) $lineN] as $x => $case) {
            $case->delete();
        }
        $table->rows--;
        $table->save();
        $modelsheet->save(); // sync meteor app
        return $this->redirect(Yii::$app->request->referrer);
    }
}