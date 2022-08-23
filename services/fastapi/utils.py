import subprocess
import sys
import json
import os

from config import CONFIG
CONFIG = CONFIG(path=None)

class UTILS(object):

  def importOrInstallPackagePython(self, package, logger):
      print(sys.executable)
      logger.info(f'checking if {package} is installed.')
      try:
        __import__(package)
        logger.info(f'package {package} is installed.')
      except:
        logger.info(f'package {package} is not installed, installing...')
        self.logging_call([sys.executable, "-m", "pip", "install", f"--target={CONFIG.APP_SERVICE_PACKAGES_PATH}", package], logger)


  def importOrInstallPackageNode(self, package, cwd, logger):
      kwargs= { "cwd": cwd }
      logger.info(f'checking if {package} is installed.')

      output = self.logging_call2([CONFIG.APP_SERVICE_NODE_EXECUTABLE, CONFIG.APP_SERVICE_NPM_EXECUTABLE, "ls", package, "--json"], logger, **kwargs)
      logger.info(f'output {output}')
      # parse output as json and check if it has a keyword "dependencies" and name of package
      json_output = json.loads(output)
      if "dependencies" in json_output and package in json_output["dependencies"]:
        logger.info(f'package {package} is installed.')
      else:
        logger.info(f'package {package} is not installed, installing...')
        self.logging_call([CONFIG.APP_SERVICE_NODE_EXECUTABLE, CONFIG.APP_SERVICE_NPM_EXECUTABLE, "install", package], logger, **kwargs)

  def runScriptPython(self, script, logger, args):
      self.logging_call([sys.executable, script] + args, logger)

  def runScriptNode(self, script, cwd, logger, args):
      kwargs= { "cwd": cwd }
      self.logging_call([CONFIG.APP_SERVICE_NODE_EXECUTABLE, script] + args, logger, **kwargs)

  # call a subprocess with logger and return the output
  def logging_call(self, popenargs, logger, **kwargs):
      logger.info(popenargs)
      process = subprocess.Popen(popenargs, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, **kwargs)

      def check_io():
        while True:
          # declare stderr as empty
          stderr = b''

          if process.stdout:
            stdout = process.stdout.readline().decode()
          if process.stderr:
            stderr = process.stderr.readline().decode()

          if stdout:
            logger.info(stdout)
          elif stderr:
            logger.info(stderr)
          else:
            break

      # keep checking stdout/stderr until the child exits
      while process.poll() is None:
        check_io()

  # run a subprocess with logger and return the output
  def logging_call2(self, popenargs, logger, **kwargs):
      logger.info(popenargs)
      process = subprocess.run(popenargs, capture_output=True, **kwargs)
      return process.stdout.decode()
