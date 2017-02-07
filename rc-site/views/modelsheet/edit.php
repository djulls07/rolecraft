<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\widgets\LinkPager;
use yii\helpers\Url;
use yii\grid\GridView;

$this->title = 'Edit model-sheets: ' . $model->name;
$this->params['breadcrumbs'][] = $this->title;
$this->params['tab_items'] = [
	[
        'label' => 'List',
        'url' => Url::toRoute(['modelsheet/index']),
        'active' => false
    ],
    [
        'label' => 'Import',
        'url' => Url::toRoute(['modelsheet/import']),
        'active' => false
    ],
    [
        'label' => 'Edit ' . Yii::$app->session->get('modelsheet_edit')->name,
        'url' => Url::toRoute(['modelsheet/edit', 'id' => Yii::$app->session->get('modelsheet_edit')->id]),
        'active' => true
    ]
]
?>
<fieldset>
    <legend>General</legend>
    <?php $form = ActiveForm::begin([
        'id' => 'edit-modelsheet-form',
        'layout' => 'horizontal',
        'fieldConfig' => [
            'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
            'labelOptions' => ['class' => 'col-lg-1 control-label'],
        ]
    ]); ?>

    <?= $form->field($model, 'name')->textInput(); ?>
    <?= $form->field($model, 'language')->textInput(); ?>
    <?= $form->field($model, 'private')->radioList(['No', 'Yes']); ?>

    <div class="form-group">
        <div class="col-lg-offset-1 col-lg-11">
            <?= Html::submitButton('Save', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
        </div>
    </div>

    <?php ActiveForm::end(); ?>
</fieldset>

<!-- Liste des sections -->
<fieldset>
    <legend>Sections</legend>
    <?= GridView::widget([
        'dataProvider' => $sectionsProvider,
        'columns' => [
            'id',
            'name',
            'position',
            [
                'attribute' => 'size',
                'value' => function ($model) {
                    return round(($model->size / 12) * 100) . '%';
                }
            ],
            [
                'attribute' => 'Actions',
                'format' => 'html',
                'value' => function($model) {
                    return '--';
                }
            ],
        ],
    ]) ?>
</fieldset>