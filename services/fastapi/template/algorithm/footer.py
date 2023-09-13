################################################################################
## footer start                                                               ##
################################################################################
import argparse

@Logger.catch
def getArgs():

  parser = argparse.ArgumentParser(description="Script params",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument("dbhost", nargs='?', default="localhost", help="server host (default: %(default)s)")
  parser.add_argument("dbport", nargs='?', default="8729", help="server port (default: %(default)s)")
  parser.add_argument("dbdatabase", nargs='?', default="typerefinery", help="server database (default: %(default)s)")
  parser.add_argument("dbquery", nargs='?', default="", help="query to use (default: %(default)s)")
  parser.add_argument("outputfile", nargs='?', default=f"{basename(__file__)}.output", help="output file (default: %(default)s)")
  return parser.parse_args()

if __name__ == '__main__':
  args = getArgs()
  # setup logger for init
  log = Logger
  log.remove()
  log.add(f'{basename(__file__)}.log', level="INFO")
  log.info(args)
  main(args.dbhost, args.dbport, args.dbdatabase, args.dbquery, args.outputfile, log)


################################################################################
## footer end                                                                 ##
################################################################################
