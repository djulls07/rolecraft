<?php
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;

$this->title = 'Register';
$this->params['breadcrumbs'][] = $this->title;
?>

<div class="site-register">
	<?php $form = ActiveForm::begin([
        'id' => 'login-form',
        'layout' => 'horizontal',
        'fieldConfig' => [
            'template' => "{label}\n<div class=\"col-lg-3\">{input}</div>\n<div class=\"col-lg-8\">{error}</div>",
            'labelOptions' => ['class' => 'col-lg-1 control-label'],
        ],
    ]); ?>

  	<?= $form->field($model, 'username')->textInput(['autofocus' => true]); ?>

  	<?= $form->field($model, 'plainPassword')->passwordInput(); ?>

  	<div class="form-group">
        <div class="col-lg-offset-1 col-lg-11">
            <?= Html::submitButton('Register', ['class' => 'btn btn-primary', 'name' => 'login-button']) ?>
        </div>
    </div>
  	<?php ActiveForm::end(); ?>
  	<div>
    	<p>No account ? <?= Html::a('Login here', ['site/login'], ['class' => 'profile-link']) ?></p>
    </div>
</div>