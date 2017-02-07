<?php

namespace app\models;

use Yii;
use yii\base\Model;
use app\models\Modelsheet;

/**
 * ModelsheetImport is the model behind the model-sheet import form
 *
 * @property file $file.
 *
 */
class ModelsheetImportForm extends Model
{
    public $file;

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            [['file'], 'file', 'skipOnEmpty' => false, /*'extensions' => 'json'*/],
        ];
    }

    public function uploadCreateUpdateModelsheet()
    {
        $pathFile = '../uploads/' . $this->file->baseName . '.' . $this->file->extension;
        if ($this->validate()) {
            $this->file->saveAs($pathFile);
            $jsonData = file_get_contents($pathFile);
            $data = json_decode($jsonData, true);
            
            // load existing one or create new
            $modelsheet = Modelsheet::findByName($data['name']);
            if (!$modelsheet) {
                $modelsheet = new Modelsheet();
            }
            
            $errors = $modelsheet->loadFromData($data);
            unlink($pathFile);
            return $errors;
        }
        return $this->errors;
    }
}
