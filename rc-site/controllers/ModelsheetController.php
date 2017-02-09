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
                'only' => ['index', 'import', 'edit', 'remove'],
                'rules' => [
                    [
                        'actions' => ['index'],
                        'allow' => true,
                        'roles' => ['@', '?'],
                    ],
                    [
                        'actions' => ['import', 'edit', 'remove'],
                        'allow' => true,
                        'roles' => ['@'],
                    ]
                ],
            ]
        ];
    }  

    /**
     * Liste les model sheets
     * @return string
     */
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

    /**
     * Import un model sheet à partir de sa representation JSON
     * @return string
     */
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
            throw new \yii\web\HttpException(401, 'Not  authorized');
        }

        if ($model->load(Yii::$app->request->post()) && $model->validate()) {
            $model->save();
            Yii::$app->session->addFlash('success', 'Modelsheet saved');
            return $this->refresh();
        }

        // Set session edit
        Yii::$app->session->set('modelsheet_edit', $model);

        return $this->render('edit', ['model' => $model]);
    }

    /**
     * Supprime un model sheet
     * @param $id int identifiant le model
     * @return string (html)
     */
    public function actionRemove($id)
    {
        $model = Modelsheet::findOne($id);
        if (!$model) {
            throw new \yii\web\HttpException(404, 'Model not found');
        }
        if ($model->user_id != Yii::$app->user->identity->id) {
            throw new \yii\web\HttpException(401, 'Not authorized');
        }
        $model->delete();
        Yii::$app->session->set('success', 'Model sheet removed successfuly');
        return $this->redirect(Yii::$app->request->referrer);
    }
}