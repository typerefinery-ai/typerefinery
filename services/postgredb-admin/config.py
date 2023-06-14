import os
import sys
import json

class CONFIG(object):

  def __init__(self, path):
    self._config = {
      "origins_schemas": [ "http", "https" ],
      "origins_ports": [ "3000", "3001", "8000", "8001", "8080", "8113" ],
      "origins_hosts": [ "localhost"],
      "allow_credentials": True,
      "allow_methods": ["*"],
      "allow_headers": ["*"]
    }

    # run self.update_path(path) if path is passed
    if path:
      self.update_path(path)

  def get_origins(self):
    _origins = []
    # for each origins_schemas, origins_ports, origins_hosts update the origins list
    for origins_schema in self._config.get("origins_schemas"):
      for origins_port in self._config["origins_ports"]:
        for origins_host in self._config["origins_hosts"]:
          _origins.append(f"{origins_schema}://{origins_host}:{origins_port}")
    return _origins

  # get raw value from config
  def get_raw(self, var_name: str) -> str:
    return self._config[var_name]

  # get raw value from config
  def get_raw_bool(self, var_name: str) -> bool:
    return self._config[var_name]

  # get variable from global
  def get(self, var_name: str) -> str:
    _env_var = os.environ.get(var_name)

    if not _env_var:
      _env_var = ""

    self._config[var_name] = _env_var

    return self._config[var_name]

  # set global vaiable
  def set(self, var_name: str, val: str):
      os.environ[var_name] = str(val)
      self.get(var_name)

  # set global variable bool
  def set_global_variable_bool(self, var_name: str, val: bool):
    if isinstance(val, bool):
      os.environ[var_name] = str(val).upper()
      self.get(var_name)
    else:
      raise TypeError(f"Must provide a bool, not a {type(val)}")

  def update_path(self, script_path):
    self.APP_SCRIPT_PATH = script_path
    self.APP_SERVICE_PACKAGES_PATH = os.path.join(script_path, "__packages__")
    sys.path.insert(0, self.APP_SERVICE_PACKAGES_PATH)
    sys.path.append(self.APP_SCRIPT_PATH)

  def toString(self):
    return json.dumps(self._config, indent=4, sort_keys=True)

  @property
  def APP_SCRIPT_PATH(self):
    """Location of main script."""
    return self.get('APP_SCRIPT_PATH')
  @APP_SCRIPT_PATH.setter
  def APP_SCRIPT_PATH(self, val):
    self.set('APP_SCRIPT_PATH', val)


  @property
  def APP_SERVICE_PACKAGES_PATH(self):
    """Location for packages."""
    return self.get('APP_SERVICE_PACKAGES_PATH')
  @APP_SERVICE_PACKAGES_PATH.setter
  def APP_SERVICE_PACKAGES_PATH(self, val):
    self.set('APP_SERVICE_PACKAGES_PATH', val)

  @property
  def APP_SERVICE_LOCATION(self):
    """Location for app services."""
    return self.get('APP_SERVICE_LOCATION')
  @APP_SERVICE_LOCATION.setter
  def APP_SERVICE_LOCATION(self, val):
    self.set('APP_SERVICE_LOCATION', val)


  @property
  def APP_USER_DATA_LOCATION(self):
    """Location for app user data."""
    return self.get('APP_USER_DATA_LOCATION')
  @APP_USER_DATA_LOCATION.setter
  def APP_USER_DATA_LOCATION(self, val):
    self.set('APP_USER_DATA_LOCATION', val)

  @property
  def APP_LOG_LOCATION(self):
    """Location for app log location."""
    return self.get('APP_LOG_LOCATION')
  @APP_LOG_LOCATION.setter
  def APP_LOG_LOCATION(self, val):
    self.set('APP_LOG_LOCATION', val)

  @property
  def APP_PACKAGE_TARGET_PATH(self):
    """App path for packages."""
    return self.get('APP_PACKAGE_TARGET_PATH')
  @APP_PACKAGE_TARGET_PATH.setter
  def APP_PACKAGE_TARGET_PATH(self, val):
    self.set('APP_PACKAGE_TARGET_PATH', val)


  # .env variables
  @property
  def APP_SERVICE_POSTGRE_HOST(self):
    """Postgre Host."""
    return self.get('APP_SERVICE_POSTGRE_HOST')
  @APP_SERVICE_POSTGRE_HOST.setter
  def APP_SERVICE_POSTGRE_HOST(self, val):
    self.set('APP_SERVICE_POSTGRE_HOST', val)

  @property
  def APP_SERVICE_POSTGRE_PORT(self):
    """Postgre Port."""
    return self.get('APP_SERVICE_POSTGRE_PORT')
  @APP_SERVICE_POSTGRE_PORT.setter
  def APP_SERVICE_POSTGRE_PORT(self, val):
    self.set('APP_SERVICE_POSTGRE_PORT', val)

  @property
  def APP_SERVICE_POSTGRE_AUTH_USERNAME(self):
    """Postgre Auth Username."""
    return self.get('APP_SERVICE_POSTGRE_AUTH_USERNAME')
  @APP_SERVICE_POSTGRE_AUTH_USERNAME.setter
  def APP_SERVICE_POSTGRE_AUTH_USERNAME(self, val):
    self.set('APP_SERVICE_POSTGRE_AUTH_USERNAME', val)

  @property
  def APP_SERVICE_POSTGRE_AUTH_PASSWORD(self):
    """Postgre Authr Password."""
    return self.get('APP_SERVICE_POSTGRE_AUTH_PASSWORD')
  @APP_SERVICE_POSTGRE_AUTH_PASSWORD.setter
  def APP_SERVICE_POSTGRE_AUTH_PASSWORD(self, val):
    self.set('APP_SERVICE_POSTGRE_AUTH_PASSWORD', val)




