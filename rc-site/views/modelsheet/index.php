<?php

use yii\helpers\Html;
use yii\helpers\Url;
use yii\bootstrap\ActiveForm;
use yii\grid\GridView;
use Yii;

$this->title = 'Model Sheets';
$this->params['breadcrumbs'][] = $this->title;
$this->params['tab_items'] = [
	[
        'label' => 'List',
        'url' => Url::toRoute(['modelsheet/index']),
        'active' => true
    ]
];
if (Yii::$app->session->get('modelsheet_edit')) {
	$this->params['tab_items'][] = [
	    'label' => 'Edit ' . Yii::$app->session->get('modelsheet_edit')->name,
        'url' => Url::toRoute(['modelsheet/edit', 'id' => Yii::$app->session->get('modelsheet_edit')->id]),
	    'active' => false
	];
}
if (Yii::$app->session->get('section_edit')) {
	$this->params['tab_items'][] = [
        'label' => 'Edit section ' . Yii::$app->session->get('section_edit')->position . ' - ' . Yii::$app->session->get('section_edit')->name,
        'url' => Url::toRoute(['section/edit', 'id' => Yii::$app->session->get('section_edit')->id]),
	    'active' => false
	];
}
if (Yii::$app->session->get('element_edit')) {
    $this->params['tab_items'][] = [
        'label' => 'Edit element ' . Yii::$app->session->get('element_edit')->label,
        'url' => Url::toRoute(['element/edit', 'id' => Yii::$app->session->get('element_edit')->id]),
        'active' => false
    ];
}
?>

<div class="modelsheet-list">
	<?= GridView::widget([
	    'dataProvider' => $dataProvider,
	    'columns' => [
	        'name',
	        [
	        	'attribute' => 'private',
	        	'value' => function($model) {
	        		return $model->private ? 'Yes' : 'No';
	        	}
	        ],
	        [
	            'attribute' => 'Actions',
	            'format' => 'html',
	            'value' => function($model) {
	            	$r = '';
	            	$r .= Html::a(
			           	'<i class="fa fa-eye"></i> view',
			           	['modelsheet/view', 'id' => $model->id],
			           	['class' => 'btn btn-xs btn-info']
		           	);
		           	if (Yii::$app->user->identity && $model->user_id == Yii::$app->user->identity->id) {
	            		$r = Html::a(
				           	'<i class="fa fa-pencil"></i> Edit',
				           	['modelsheet/edit', 'id' => $model->id],
				           	['class' => 'btn btn-xs btn-warning']
			           	)
			           	.Html::a(
				           	'<i class="fa fa-trash"></i> Remove',
				           	['modelsheet/remove', 'id' => $model->id],
				           	['class' => 'btn btn-xs btn-danger my-confirm']
			           	);
	            	}
	            	return $r;
	            }
	        ],
	        
	    ],
	]) ?>
</div>