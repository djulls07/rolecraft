<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Modelsheet;
use app\models\Section;
use yii\data\ActiveDataProvider;

class SectionController extends Controller
{

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['remove'],
                'rules' => [
                    [
                        'actions' => ['remove'],
                        'allow' => true,
                        'roles' => ['@'],
                    ]
                ],
            ]
        ];
    }

    public function actionRemove($id)
    {
        $section = Section::findOne($id);
        if (!$section) {
            throw new \yii\web\HttpException(404, 'Section Not found');
        }
        $modelsheet = $section->getModelsheet()->one();
        if ($modelsheet->getUser()->one()->id != Yii::$app->user->identity->id) {
            throw new \yii\web\HttpException(401, 'Forbidden');
        }
        $section->delete();
        
        // No need to re order sections.position because it is done by saving modelsheet ( before sync with meteor/mongo )
        $modelsheet->save(); // trigger sync with meteor app
        return $this->redirect(Yii::$app->request->referrer);
    }

    public function actionEdit($id)
    {
        $section = Section::findOne($id);
        
        if (!$section) {
            throw new \yii\web\HttpException(404, 'Section Not found');
        }
        $modelsheet = $section->getModelsheet()->one();

        // set session
        Yii::$app->session->set('section_edit', $section);

        if ($section->load(Yii::$app->request->post()) && $section->validate()) {
            $section->save();
            // re order if needed & sync meteor app
            $modelsheet->save();
            Yii::$app->session->addFlash('success', 'Section has been saved');
            return $this->refresh();
        }

        $positions = [];
        for($i = 0; $i < $modelsheet->getSections()->count(); $i++) {
            $positions[] = $i;
        }

        // List elements
        $elementProvider = new ActiveDataProvider([
            'query' => $section->getElements(),
            'pagination' => [
                'pageSize' => 10,
            ]
        ]);

        return $this->render('edit', [
            'section' => $section,
            'modelsheet' => $modelsheet,
            'positions' => $positions,
            'elementProvider' => $elementProvider
            ]
        );
    }
}