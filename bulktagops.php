<?php

/**
 * Demo Plugin.
 *
 * This plugin tries to completely cover Shaarli's plugin API.
 * Can be used by plugin developers to make their own plugin.
 */

/*
 * RENDER HEADER, INCLUDES, FOOTER
 *
 * Those hooks are called at every page rendering.
 * You can filter its execution by checking _PAGE_ value
 * and check user status with _LOGGEDIN_.
 */

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
        /*
         * Add additional input fields in the tools.
         * A field is an array containing:
         *  [
         *      'form-attribute-1' => 'form attribute 1 value',
         *      'form-attribute-2' => 'form attribute 2 value',
         *      'inputs' => [
         *          [
         *              'input-1-attribute-1 => 'input 1 attribute 1 value',
         *              'input-1-attribute-2 => 'input 1 attribute 2 value',
         *          ],
         *          [
         *              'input-2-attribute-1 => 'input 2 attribute 1 value',
         *          ],
         *      ],
         *  ]
         * This example renders as:
         * <form form-attribute-1="form attribute 1 value" form-attribute-2="form attribute 2 value">
         *   <input input-1-attribute-1="input 1 attribute 1 value" input-1-attribute-2="input 1 attribute 2 value">
         *   <input input-2-attribute-1="input 2 attribute 1 value">
         * </form>
         */
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
        // Note that you just need to specify CSS path.
        $data['js_files'][] = PluginManager::$PLUGINS_PATH . '/bulktagops/bundle.js';
    }

    return $data;
}
