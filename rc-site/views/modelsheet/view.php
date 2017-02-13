<?php

use yii\helpers\Html;
use yii\helpers\Url;
use yii\bootstrap\ActiveForm;
use Yii;

$this->title = 'Model: "' .$model->name . '"';
$this->params['breadcrumbs'][] = $this->title;
$this->params['tab_items'] = [
	[
        'label' => 'List',
        'url' => Url::toRoute(['modelsheet/index']),
        'active' => false
    ]
];
?>

<h1><?= Html::encode($this->title) ?></h1>
<div class="modelsheet">
    <?php foreach($model->getSections()->orderBy('position')->all() as $section): ?>
        <div id="section_<?= $section->id; ?>" class="section col-sm-<?= $section->size; ?>">
            <div class="section-header">
                <input
                	disabled
                    value="<?= $section->name ? $section->name : 'Unamed section' ; ?>"
                    type="text"
                    class="input-minimalist"
                >
            </div>
            <?php foreach($section->getElements()->all() as $element): ?>
                <div class="element">
                    <div class="element-header">
                        <span class="text-success">
                            <input
                            	disabled
                                value="<?= $element->label; ?>"
                                type="text"
                                class="input-minimalist"
                            >
                        </span>
                        <span class="text-info pull-right">
                            (<?= $element->type; ?>)
                        </span>
                    </div>
                    <?php foreach($element->getTables()->all() as $table): ?>
                        <?php $cases = $table->getOrderedBoxes(); ?>
                        <table class="element-table">
                            <?php for($i = 0; $i < $table->rows; $i++): ?>
                                <tr>
                                    <?php for($j = 0; $j < $table->cols; $j++): ?>
                                        <td>
                                            <?php if (isset($cases[$i][$j])): ?>
                                                <input
                                                	disabled
                                                    value="<?= $cases[$i][$j]->label; ?>"
                                                    type="text"
                                                    class="input-minimalist input-element-table"
                                                >
                                            <?php endif; ?>
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