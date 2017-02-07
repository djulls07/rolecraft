<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\widgets\LinkPager;
use yii\helpers\Url;

$this->title = 'Importing model sheets';
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
        'label' => 'Edit section ' . Yii::$app->session->get('section_edit')->id . ' - ' . Yii::$app->session->get('section_edit')->name,
        'url' => Url::toRoute(['section/edit', 'id' => Yii::$app->session->get('section_edit')->id]),
        'active' => false
    ];
}
?>

<?php $form = ActiveForm::begin([
    'id' => 'import-modelsheet-form',
    'layout' => 'horizontal',
    'fieldConfig' => [
        'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
        'labelOptions' => ['class' => 'col-lg-1 control-label'],
    ],
    'options' => ['enctype' => 'multipart/form-data']
]); ?>

<?= $form->field($importForm, 'file')->fileInput(); ?>

<div class="import-errors">
	<?php if ($importErrors && count($importErrors)):?>
		<?= var_dump($importErrors) ?>
	<?php endif; ?>
</div>

<div class="form-group">
    <div class="col-lg-offset-1 col-lg-11">
        <?= Html::submitButton('Import', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
    </div>
</div>

<?php ActiveForm::end(); ?>
