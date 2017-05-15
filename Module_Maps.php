<?php
final class Module_Maps extends GWF_Module
{
	public function getVersion() { return 1.00; }
	public function getDefaultPriority() { return 15; }
	public function getDefaultAutoLoad() { return true; }
	public function onLoadLanguage() { return $this->loadLanguage('lang/maps'); }
	
	public function cfgApiKey() { return $this->getModuleVar('maps_api_key', 'AIzaSyBrEK28--B1PaUlvpHXB-4MzQlUjNPBez0'); }
	public function cfgSensors() { return $this->getModuleVarBool('maps_sensors', true); }
	
	public function onInstall($dropTable)
	{
		return GWF_ModuleLoader::installVars($this, array(
			'maps_api_key' => array('AIzaSyBrEK28--B1PaUlvpHXB-4MzQlUjNPBez0', 'text', '0', '128'),
			'maps_sensors' => array(true, 'bool'),
		));
	}
	
	public function onStartup()
	{
		GWF_Website::addJavascript($this->googleMapsScriptURL());
	
		$this->addCSS('gwf-maps.css');
		
		if (Module_GWF::instance()->cfgAngularApp())
		{
			$this->addJavascript('gwf-map-util.js');
			$this->addJavascript('gwf-location-bar-controller.js');
			$this->addJavascript('gwf-location-picker.js');
			$this->addJavascript('gwf-position-service.js');
		}
	}
	
	public function googleMapsScriptURL()
	{
		$protocol = Common::getProtocol();
		$sensors = $this->cfgSensors() ? 'true' : 'false';
		$apikey = $this->cfgApiKey();
		if (!empty($apikey)) {
			$apikey = '&key='.$apikey;
		}
		return sprintf('%s://maps.google.com/maps/api/js?sensors=%s%s', $protocol, $sensors, $apikey);
	}

	###############
	### Sidebar ###
	###############
	public function sidebarContent($bar)
	{
		$this->onLoadLanguage();
		if ($bar === 'top') {
			return $this->template('position-state.php');
		}
		if ($bar === 'right') {
			return $this->template('location-bar.php');
		}
	}
	
}
