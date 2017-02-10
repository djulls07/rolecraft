<?php

use yii\helpers\Html;
use yii\helpers\Url;
use yii\bootstrap\ActiveForm;
use yii\grid\GridView;
use Yii;

$this->title = 'Edit section ' . $section->id . ' ' . $section->name;
$this->params['breadcrumbs'][] = [
	'label' => 'Edit model-sheets: ' . $modelsheet->name,
	'url' => ['modelsheet/edit', 'id' => $modelsheet->id]
];
$this->params['breadcrumbs'][] = $this->title;
$this->params['tab_items'] = [
	[
        'label' => 'List',
        'url' => Url::toRoute(['modelsheet/index']),
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
	    'active' => true
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
<div class="edit-section">
	<fieldset>
		<legend>General</legend>
		<?php $form = ActiveForm::begin([
		        'id' => 'edit-section-form',
		        'layout' => 'horizontal',
		        'fieldConfig' => [
		            'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
		            'labelOptions' => ['class' => 'col-lg-1 control-label'],
		        ]
		    ]); ?>

			<?= $form->field($section, 'name')->textInput(); ?>

			<?= $form->field($section, 'position')->dropdownList($positions,
			    ['prompt'=>'Select Position']
			); ?>

			<?= $form->field($section, 'size')->dropdownList(
				[12 => '100%', 9 => '75%', 8 => '66%', 6 => '50%', 4 => '33%', 3 => '25%'],
				['prompt' => 'Select size']
			); ?>

			<div class="form-group">
			    <div class="col-lg-offset-1 col-lg-11">
			        <?= Html::submitButton('<i class="fa fa-floppy-o"></i> Save', ['class' => 'btn btn-primary', 'name' => 'import-button']); ?>

			        <?= Html::a(
				        '<i class="fa fa-hand-o-left"></i> Back',
				        ['modelsheet/edit', 'id' => $modelsheet->id],
				        ['class' => 'btn btn-danger']
			        ); ?>
			    </div>
			</div>
		<?php ActiveForm::end(); ?>
	</fieldset>

	<fieldset>
		<legend>Elements in section</legend>
		<div class="">
			<div class="section col-sm-<?= $section->size; ?>">
                <div class="section-header">
                    <?= $section->position . ' - ' . $section->name; ?>
                </div>
			    <?php foreach($section->getElements()->all() as $element): ?>
			        <div class="element">
			        	<div class="element-header">
			            	<span class="text-success">
                            	<?= $element->label; ?>:
	                        </span>
	                        <span class="text-info pull-right">
	                            (<?= $element->type; ?>)
	                            &nbsp;<?= Html::a(
				            		'<i class="fa fa-pencil"></i>',
				            		['element/edit', 'id' => $element->id],
				            		['title' => 'Edit element']
				            	); ?>
	                        </span>
			            </div>
			            <?php if ($element->type == 'table'):?>
			                <?php foreach($element->getTables()->all() as $table): ?>
			                	<?php $cases = $table->getOrderedBoxes(); ?>
				                <table class="element-table">
				                    <?php for ($i = 0; $i < $table->rows; $i++): ?>
				                        <tr>
				                            <?php for ($j = 0; $j < $table->cols; $j++): ?>
				                                <td>
				                                	<input
                                                        value="<?= $cases[$i][$j]->label; ?>"
                                                        type="text"
                                                        class="input-minimalist"
                                                        update-name="label"
                                                        update-url="<?= Url::toRoute(['tablebox/updatefield', 'id' => $cases[$i][$j]->id, 'field' => 'label']); ?>"
                                                    >
				                                </td>
				                            <?php endfor; ?>
				                        </tr>
				                    <?php endfor; ?>
				                </table>
				            <?php endforeach; ?>
				        <?php endif;?>
			        </div>
			    <?php endforeach; ?>
			</div>
		</div>
	</fieldset>
</div>