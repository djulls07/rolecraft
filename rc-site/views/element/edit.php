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
            'id' => 'edit-element-form',
            'layout' => 'horizontal',
            'fieldConfig' => [
                'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
                'labelOptions' => ['class' => 'col-lg-1 control-label'],
            ]
        ]); ?>
        <fieldset>
            <legend>General</legend>
            <?= $form->field($element, 'label')->textInput(); ?>
            <?= $form->field($element, 'type')->dropdownList([
                'text' => 'Text',
                'textarea' => 'Textarea',
                'table' => 'Table'
            ],[
                'submit-on-change' => 'edit-element-form'
            ]); ?>
        </fieldset>

        <?php if ($element->type == 'table'): ?>
            <fieldset>
                <legend style="text-transform: capitalize;"><?= $element->type; ?></legend>
                <?= 
                    $form->field($table, 'rows')->textInput([])->label('Rows');
                ?>
                <?= 
                    $form->field($table, 'cols')->textInput([])->label('Columns');
                ?>
                <table class="element-table">
                    <?php for($i = 0; $i < $table->rows; $i++): ?>
                        <tr>
                            <td style="width: 25px; font-size: 1.2em;">
                                <?= 
                                    Html::a(
                                        '<i class="fa fa-trash"></i>',
                                        ['table/removeline', 'id' => $table->id, 'lineN' => $i]
                                    );
                                ?> 
                            </td>
                            <?php for($j = 0; $j < $table->cols; $j++): ?>
                                <td>
                                    <input class="input-element-table" value="<?= $cases[$i][$j]->label; ?>" name="cases[<?= $i; ?>][<?= $j; ?>][TableBox][label]" type="text" >
                                </td>
                            <?php endfor; ?>
                        </tr>
                    <?php endfor; ?>
                </table>
            </fieldset>
        <?php endif; ?>
        <br />
        <div class="form-group">
            <div class="col-lg-offset-1 col-lg-11">
                <?= Html::submitButton('<i class="fa fa-floppy-o"></i> Save', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
                <?= Html::a('<i class="fa fa-hand-o-left"></i> Back', ['section/edit', 'id' => $section->id], ['class' => 'btn btn-danger']); ?>
            </div>
        </div>
    <?php ActiveForm::end(); ?>
</div>