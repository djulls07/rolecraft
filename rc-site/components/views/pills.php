<ul class="nav nav-pills">
    <?php foreach($items as $item): ?>
        <li class="<?= $item['active'] ? 'active' : '' ?>">
            <a href="<?= $item['url'] ?>"><?= $item['label']; ?></a>
        </li>
    <?php endforeach; ?>
</ul>