<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Modelsheet;
use app\models\Element;
use yii\data\ActiveDataProvider;
use app\models\TableBox;

class ElementController extends Controller
{	
	public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['edit'],
                'rules' => [
                    [
                        'actions' => ['edit'],
                        'allow' => true,
                        'roles' => ['@'],
                    ]
                ],
            ]
        ];
    }

	public function actionEdit($id)
	{
		$element = Element::findOne($id);
		if (!$element) {
			throw new \yii\web\HttpException(401, 'Forbidden');
		}
		$section = $element->getSection()->one();
		$modelsheet = $section->getModelsheet()->one();
		$table = $element->getTables()->one(); // only one for now
		$cases = [];
		if ($table) {
			$cases = $table->getFormatedTableBoxes();
			for ($i = 0; $i < $table->rows; $i++) {
	            for ($j = 0; $j < $table->cols; $j++) {
	            	if (!isset($cases[$i][$j])) {
	            		$cases[$i][$j] = new TableBox();
	            		$cases[$i][$j]->table_id = $table->id;
	            		$cases[$i][$j]->x = $i;
	            		$cases[$i][$j]->y = $j;
	            		$cases[$i][$j]->save();
	            	}
	            }
			}
		}
		
		Yii::$app->session->set('element_edit', $element);

		if ($element->load(Yii::$app->request->post()) && $element->validate()) {
			$element->save();

			// handle cases ( tableboxes )
			$casesPost = Yii::$app->request->post()['cases'];

			if ($table) {
				for ($i = 0; $i < $table->rows; $i++) {
		            for ($j = 0; $j < $table->cols; $j++) {
		            	//$cases[$i][$j]->label = $casesPost[$i][$j]['label'];
						if ($cases[$i][$j]->load($casesPost[$i][$j]) && $cases[$i][$j]->validate()) {
							$cases[$i][$j]->save();
						}
						
		            }
				}
			}

			$modelsheet->save(); // trigger sync modelsheet
			Yii::$app->session->addFlash('success', 'Element saved');
			return $this->refresh();
		}

		return $this->render('edit', [
			'element' => $element,
			'section' => $section,
			'modelsheet' => $modelsheet,
			'table' => $table,
			'cases' => $cases
		]);
	}
}