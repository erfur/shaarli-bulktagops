<?php

use Shaarli\Bookmark\Bookmark;
use Shaarli\Config\ConfigManager;
use Shaarli\Plugin\PluginManager;
use Shaarli\Render\TemplatePage;

/*
 * This is not necessary, but it's easier if you don't want Poedit to mix up your translations.
 */
function bulktagops_t($text, $nText = '', $nb = 1)
{
    return t($text, $nText, $nb, EXT_TRANSLATION_DOMAIN);
}

/**
 * Initialization function.
 * It will be called when the plugin is loaded.
 * This function can be used to return a list of initialization errors.
 *
 * @param $conf ConfigManager instance.
 *
 * @return array List of errors (optional).
 */
function bulktagops_init($conf)
{
    $apiKey = $conf->get('plugins.BULKTAGOPS_REST_API_KEY');
    if (empty($apiKey)) {
        $error = t('Bulktagops plugin error: ' . 'REST API key is required to function properly.');
        return [$error];
    }
}

/**
 * Hook render_header.
 * Executed on every page render.
 *
 * Template placeholders:
 *   - buttons_toolbar
 *   - fields_toolbar
 *
 * @param array $data data passed to plugin
 *
 * @return array altered $data.
 */
function hook_bulktagops_render_header($data, $conf)
{
    // Only execute when linklist is rendered and logged in.
    if ($data['_PAGE_'] == TemplatePage::LINKLIST and $data['_LOGGEDIN_'] === true) {

        $form = [
            'attr' => [
                'method' => 'GET',
                'action' => $data['_BASE_PATH_'] . '/',
                'class' => 'bulktagform',
            ],
            'inputs' => [
                [
                    'type' => 'text',
                    'name' => 'tags',
                    'placeholder' => 'tags',
                    'class' => 'bulktaginput',
                    'key' => $conf->get('plugins.BULKTAGOPS_REST_API_KEY'),
                    'autocomplete' => 'off',
                    'data-multiple' => '',
                    'data-minChars' => '1',
                    'data-list' => '',
                ]
            ]
        ];
        $data['fields_toolbar'][] = $form;
    }

    return $data;
}

/**
 * Hook render_footer.
 * Executed on every page render.
 *
 * Template placeholders:
 *   - text
 *   - endofpage
 *   - js_files
 *
 * Data:
 *   - _PAGE_: current page
 *   - _LOGGEDIN_: true/false
 *
 * @param array $data data passed to plugin
 *
 * @return array altered $data.
 */
function hook_bulktagops_render_footer($data)
{
    if ($data['_PAGE_'] == TemplatePage::LINKLIST and $data['_LOGGEDIN_'] === true) {
        // List of plugin's JS files.
        $data['js_files'][] = PluginManager::$PLUGINS_PATH . '/bulktagops/bundle.js';
    }

    return $data;
}
