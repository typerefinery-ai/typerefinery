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


  @property
  def APP_SERVICE_NODE_LOCATION(self):
    """Location for NODE service."""
    return self.get('APP_SERVICE_NODE_LOCATION')
  @APP_SERVICE_NODE_LOCATION.setter
  def APP_SERVICE_NODE_LOCATION(self, val):
    self.set('APP_SERVICE_NODE_LOCATION', val)

  @property
  def APP_SERVICE_NODE_EXECUTABLE(self):
    """Path to NODE service executable."""
    return self.get('APP_SERVICE_NODE_EXECUTABLE')
  @APP_SERVICE_NODE_EXECUTABLE.setter
  def APP_SERVICE_NODE_EXECUTABLE(self, val):
    self.set('APP_SERVICE_NODE_EXECUTABLE', val)

  @property
  def APP_SERVICE_NPM_EXECUTABLE(self):
    """Path to NPM service executable."""
    return self.get('APP_SERVICE_NPM_EXECUTABLE')
  @APP_SERVICE_NPM_EXECUTABLE.setter
  def APP_SERVICE_NPM_EXECUTABLE(self, val):
    self.set('APP_SERVICE_NPM_EXECUTABLE', val)

  # .env variables
  @property
  def APP_SERVICE_TYPEDB_HOST(self):
    """Typedb Host."""
    return self.get('APP_SERVICE_TYPEDB_HOST')
  @APP_SERVICE_TYPEDB_HOST.setter
  def APP_SERVICE_TYPEDB_HOST(self, val):
    self.set('APP_SERVICE_TYPEDB_HOST', val)

  @property
  def APP_SERVICE_TYPEDB_PORT(self):
    """Typedb Port."""
    return self.get('APP_SERVICE_TYPEDB_PORT')
  @APP_SERVICE_TYPEDB_PORT.setter
  def APP_SERVICE_TYPEDB_PORT(self, val):
    self.set('APP_SERVICE_TYPEDB_PORT', val)

  @property
  def APP_SERVICE_TYPEDB_DB(self):
    """Typedb DB."""
    return self.get('APP_SERVICE_TYPEDB_DB')
  @APP_SERVICE_TYPEDB_DB.setter
  def APP_SERVICE_TYPEDB_DB(self, val):
    self.set('APP_SERVICE_TYPEDB_DB', val)

  @property
  def APP_SERVICE_FLOW_PORT(self):
    """Flow ports."""
    return self.get('APP_SERVICE_FLOW_PORT')
  @APP_SERVICE_FLOW_PORT.setter
  def APP_SERVICE_FLOW_PORT(self, val):
    self.set('APP_SERVICE_FLOW_PORT', val)

  @property
  def APP_SERVICE_MESSAGESERVICE_PORT(self):
    """Message service port."""
    return self.get('APP_SERVICE_MESSAGESERVICE_PORT')
  @APP_SERVICE_MESSAGESERVICE_PORT.setter
  def APP_SERVICE_MESSAGESERVICE_PORT(self, val):
    self.set('APP_SERVICE_MESSAGESERVICE_PORT', val)

  @property
  def APP_SERVICE_CMS_PORT(self):
    """CMS port."""
    return self.get('APP_SERVICE_CMS_PORT')
  @APP_SERVICE_CMS_PORT.setter
  def APP_SERVICE_CMS_PORT(self, val):
    self.set('APP_SERVICE_CMS_PORT', val)

  @property
  def APP_SERVICE_MONGO_PORT(self):
    """CMS port."""
    return self.get('APP_SERVICE_MONGO_PORT')
  @APP_SERVICE_MONGO_PORT.setter
  def APP_SERVICE_MONGO_PORT(self, val):
    self.set('APP_SERVICE_MONGO_PORT', val)

  @property
  def APP_SERVICE_NGINX_PORT(self):
    """CMS port."""
    return self.get('APP_SERVICE_NGINX_PORT')
  @APP_SERVICE_NGINX_PORT.setter
  def APP_SERVICE_NGINX_PORT(self, val):
    self.set('APP_SERVICE_NGINX_PORT', val)



