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
];

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

<?php $form = ActiveForm::begin([
        'id' => 'edit-modelsheet-form',
        'layout' => 'horizontal',
        'fieldConfig' => [
            'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
            'labelOptions' => ['class' => 'col-lg-1 control-label'],
        ]
    ]); ?>

<fieldset>
    <legend>General</legend>

    <?= $form->field($model, 'name')->textInput(); ?>
    <?= $form->field($model, 'language')->textInput(); ?>
    <?= $form->field($model, 'private')->radioList(['No', 'Yes']); ?>

    <div class="form-group">
        <div class="col-lg-offset-1 col-lg-11">
            <?= Html::submitButton('<i class="fa fa-floppy-o"></i> Save', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
        </div>
    </div>
</fieldset>

<!-- Liste des sections -->
<fieldset>
    <legend>Resume ( Sections )</legend>
    <div class="modelsheet">
        <?php foreach($model->getSections()->orderBy('position')->all() as $section): ?>
            <div class="section col-sm-<?= $section->size; ?>">
                <div class="section-header">
                    <?= $section->position . ' - ' . $section->name; ?>
                    <?= Html::a(
                        '<i class="fa fa-pencil"></i>',
                        ['section/edit', 'id' => $section->id],
                        ['class' => 'pull-right', 'title' => 'Edit section']
                    ) ?>
                </div>
                
                <?php foreach($section->getElements()->all() as $element): ?>
                    <div class="element">
                        <div class="element-header">
                            <span class="text-success">
                                <?= $element->label; ?>:
                            </span>
                            <span class="text-info pull-right">
                                (<?= $element->type; ?>)
                            </span>
                        </div>
                        <?php foreach($element->getTables()->all() as $table): ?>
                            <?php $cases = $table->getFormatedTableBoxes(); ?>
                            <table class="element-table">
                                <?php for($i = 0; $i < $table->rows; $i++): ?>
                                    <tr>
                                        <?php for($j = 0; $j < $table->cols; $j++): ?>
                                            <td>
                                                <?php if (isset($cases[$i][$j]) && $cases[$i][$j]->label) {
                                                    echo '<strong>' . $cases[$i][$j]->label . '</strong>';
                                                }?>
                                            </td>
                                        <?php endfor; ?>
                                    </tr>
                                <?php endfor; ?>
                            </table>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    </div>
</fieldset>
<div class="form-group">
    <div>
        <?= Html::submitButton('<i class="fa fa-floppy-o"></i> Save', ['class' => 'btn btn-primary', 'name' => 'import-button']) ?>
    </div>
</div>
<?php ActiveForm::end(); ?>