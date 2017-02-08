<?php

use yii\helpers\Html;
use yii\helpers\Url;
use yii\bootstrap\ActiveForm;
use yii\grid\GridView;
use Yii;

$this->title = 'Edit element ' . $element->label;
$this->params['breadcrumbs'][] = [
	'label' => 'Edit model-sheets: ' . $modelsheet->name,
	'url' => ['modelsheet/edit', 'id' => $modelsheet->id]
];
$this->params['breadcrumbs'][] = [
    'label' => 'Edit section ' . $section->id . ' ' . $section->name,
    'url' => ['modelsheet/edit', 'id' => $modelsheet->id]
];

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
        'active' => true
    ];
}
?>
<div class="edit-element">
    <?php 
        $form = ActiveForm::begin([
            'id' => 'edit-section-form',
            'layout' => 'horizontal',
            'fieldConfig' => [
                'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
                'labelOptions' => ['class' => 'col-lg-1 control-label'],
            ]
        ]); ?>

        <?= $form->field($element, 'label')->textInput(); ?>

        <?php if ($table): ?>
            <table class="element-table">
                <?php for($i = 0; $i < $table->rows; $i++): ?>
                    <tr>
                        <?php for($j = 0; $j < $table->cols; $j++): ?>
                            <td>
                                <input value="<?= $cases[$i][$j]->label; ?>" name="cases[<?= $i; ?>][<?= $j; ?>][TableBox][label]" type="text" >
                            </td>
                        <?php endfor; ?>
                    </tr>
                <?php endfor; ?>
            </table>
        <?php endif; ?>

        <div class="form-group">
            <div class="col-lg-offset-1 col-lg-11">
                <?= Html::submitButton('Save', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
            </div>
        </div>
    <?php ActiveForm::end(); ?>
</div>