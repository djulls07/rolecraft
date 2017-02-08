<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Modelsheet;
use yii\data\Pagination;
use app\models\ModelsheetImportForm;
use yii\web\UploadedFile;
use yii\data\ActiveDataProvider;

class ModelsheetController extends Controller
{

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['index', 'import', 'edit'],
                'rules' => [
                    [
                        'actions' => ['index'],
                        'allow' => true,
                        'roles' => ['@', '?'],
                    ],
                    [
                        'actions' => ['import', 'edit'],
                        'allow' => true,
                        'roles' => ['@'],
                    ]
                ],
            ]
        ];
    }  

    public function actionIndex()
    {
    	if (Yii::$app->user->identity) {
    		$query = Modelsheet::getAll();
    	} else {
    		$query = Modelsheet::getPublics();
    	}

        $provider = new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => 10,
            ]
        ]);

    	return $this->render('index', [
            'dataProvider' => $provider
        ]);
    }

    public function actionImport()
    {
        $importForm = new ModelsheetImportForm();

        $importErrors = [];
        // handle file upload
        if (Yii::$app->request->isPost) {
            $importForm->file = UploadedFile::getInstance($importForm, 'file');
            $importErrors = $importForm->uploadCreateUpdateModelsheet();
            if ($importErrors == 0) {
                Yii::$app->session->addFlash('success', 'Model sheet has been saved');
                return $this->redirect(['modelsheet/index']);
            }
        }
        return  $this->render('import', [
            'importForm' => $importForm,
            'importErrors' => $importErrors
        ]);
    }

    /**
     * Edition du modelsheet et liste des sections avec actions associés
     * @return string
     */
    public function actionEdit($id)
    {
        $model = Modelsheet::findOne($id);

        if ($model->getUser()->one()->id != Yii::$app->user->identity->id) {
            throw new \yii\web\HttpException(401, 'Forbidden');
        }

        if ($model->load(Yii::$app->request->post()) && $model->validate()) {
            $model->save();
            Yii::$app->session->addFlash('success', 'Modelsheet saved');
            return $this->refresh();
        }

        // Set session edit
        Yii::$app->session->set('modelsheet_edit', $model);

        // List sections
        $sectionsProvider = new ActiveDataProvider([
            'query' => $model->getSections(),
            'sort'=> ['defaultOrder' => ['position' => SORT_ASC]],
            'pagination' => [
                'pageSize' => 4,
            ]
        ]);

        return $this->render('edit', ['model' => $model, 'sectionsProvider' => $sectionsProvider]);
    }
}