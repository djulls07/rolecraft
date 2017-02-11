<?php

namespace app\components;

use yii\base\Widget;
use yii\helpers\Html;

class PillsWidget extends Widget
{
    public $items;

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        return $this->render('pills', [
            'items' => $this->items
        ]);
    }
}