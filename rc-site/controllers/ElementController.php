<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Modelsheet;
use app\models\Element;
use yii\data\ActiveDataProvider;
use app\models\TableBox;
use app\models\Table;

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
			// create all tableBoxes that does not exists ( for form )
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
		Yii::$app->session->set('section_edit', $section);
        Yii::$app->session->set('modelsheet_edit', $modelsheet);

        // handle post
		if ($element->load(Yii::$app->request->post()) && $element->validate()) {
			$element->save();

			if ($element->type == 'table') {
				if ($table) {
					$table->load(Yii::$app->request->post());
					if ($table->validate()) {
						$table->save();
					}
					if (isset(Yii::$app->request->post()['cases'])) {
						// handle cases ( tableboxes )
						$casesPost = Yii::$app->request->post()['cases'];
						for ($i = 0; $i < $table->rows; $i++) {
				            for ($j = 0; $j < $table->cols; $j++) {
				            	if (!isset($cases[$i][$j]) || !isset($casesPost[$i][$j])) break; // case change rows or cols of table
								if ($cases[$i][$j]->load($casesPost[$i][$j]) && $cases[$i][$j]->validate()) {
									$cases[$i][$j]->save();
								}
				            }
						}
					}
				} else {
					// create table empty & refresh will create the tableBoxes..
					$table = new Table();
					$table->rows = 1;
					$table->cols = 3;
					$table->element_id = $element->id;
					$table->save();
				}
			} else {
				// remove table
				if ($table) {
					$table->delete();
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