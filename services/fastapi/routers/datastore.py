
from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from pydantic import BaseModel, Field
from datetime import datetime
import random
from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.fastapi import GraphQLRouter

router = APIRouter()

from config import CONFIG
CONFIG = CONFIG(path=None)

# import Utils from parent module
import sys
sys.path.append("..")
from utils import UTILS
UTILS = UTILS()

from .data.project import Project as ProjectModel, ProjectUtils
from .data.connection import Connection as ConnectionModel, ConnectionUtils
from .data.query import Queries as QueryModel, QueryUtils
from .data.theme import Theme as ThemeModel, ThemeUtils
from .data.flow import Flow as FlowModel, FlowUtils

ProjectUtils = ProjectUtils()
ConnectionUtils = ConnectionUtils()
QueryUtils = QueryUtils()
ThemeUtils = ThemeUtils()
FlowUtils = FlowUtils()


sqlite_file_name = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "database.db")
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@router.on_event("startup")
def on_startup():
    create_db_and_tables()

### Rest Interface for this datastore

## PROJECT

@Logger.catch
@router.post("/datastore/project")
async def create_project(body: ProjectModel):
  return ProjectUtils.create_project(project=body, engine=engine)

@Logger.catch
@router.put("/datastore/project/{projectid}")
async def update_project(projectid: str, body: ProjectModel):
  return ProjectUtils.update_project(projectid=projectid, project=body, engine=engine)

@Logger.catch
@router.get("/datastore/project")
async def read_projects():
  return ProjectUtils.read_projects(engine=engine)

# @Logger.catch
# @router.get("/datastore/projects") 
# async def read_projects(): 
#   return ProjectUtils.read_projects(engine=engine) 

@Logger.catch
@router.get("/datastore/projects/cms") 
async def read_projects(): 
  return {
   "columns":[
      {
         "field":"projectid",
         "title":"Project Id"
      },
      {
         "field":"flowid",
         "title":"Flow Id"
      },
      {
         "field":"icon",
         "title":"Icon"
      },
      {
         "field":"data",
         "title":"Data"
      },
      {
         "field":"flowoutputlist",
         "title":"Flow Output List"
      },
      {
         "field":"label",
         "title":"Label"
      },
      {
         "field":"description",
         "title":"Description"
      }
   ],
   "data":ProjectUtils.read_projects(engine=engine)
}

@Logger.catch
@router.get("/datastore/project/{projectid}")
async def read_project(projectid: str):
  return ProjectUtils.read_project(projectid=projectid, engine=engine)

@Logger.catch
@router.delete("/datastore/project/{projectid}")
async def delete_project(projectid: str):
  return ProjectUtils.delete_project(projectid=projectid, engine=engine)

## CONNECTION

@Logger.catch
@router.post("/datastore/connection")
async def create_connection(body: ConnectionModel):
  return ConnectionUtils.create_connection(connection=body, engine=engine)

@Logger.catch
@router.put("/datastore/connection/{connectionid}")
async def update_connection(connectionid: str, body: ConnectionModel):
  return ConnectionUtils.update_connection(connectionid=connectionid, connection=body, engine=engine)

@Logger.catch
@router.get("/datastore/connection")
async def read_connections():
  return ConnectionUtils.read_connections(engine=engine)

@Logger.catch
@router.get("/datastore/connectios/cms") 
async def connection_list():
  return {
   "columns":[
      {
         "field":"connectionid",
         "title":"Connection Id"
      },
      {
         "field":"projectid",
         "title":"Project Id"
      },
       {
         "field":"database",
         "title":"Database"
      },
       {
         "field":"type",
         "title":"Type"
      },
      {
         "field":"icon",
         "title":"Icon"
      },
       {
         "field":"host",
         "title":"Host"
      },
      {
         "field":"port",
         "title":"Port"
      },
      {
         "field":"scope",
         "title":"Scope"
      },
      {
         "field":"label",
         "title":"Label"
      },
      {
         "field":"description",
         "title":"Description"
      }
   ],
   "data": ConnectionUtils.read_connections(engine=engine)
}

@Logger.catch
@router.get("/datastore/connection/{connectionid}")
async def read_connection(connectionid: str):
  return ConnectionUtils.read_connection(connectionid=connectionid, engine=engine)

@Logger.catch
@router.delete("/datastore/connection/{connectionid}")
async def delete_connection(connectionid: str):
  return ConnectionUtils.delete_connection(connectionid=connectionid, engine=engine)

## QUERY

@Logger.catch
@router.post("/datastore/query")
async def create_query(body: QueryModel):
  return QueryUtils.create_query(query=body, engine=engine)

@Logger.catch
@router.put("/datastore/query/{queryid}")
async def update_query(queryid: str, body: QueryModel):
  return QueryUtils.update_query(queryid=queryid, query=body, engine=engine)

@Logger.catch
@router.get("/datastore/query")
async def read_querys():
  return QueryUtils.read_querys(engine=engine)

@Logger.catch
@router.get("/datastore/queries/cms") 
async def query_list():
  return {
    "columns":[
      {
         "field":"projectid",
         "title":"Project Id"
      },
      {
         "field":"queryid",
         "title":"Query Id"
      },
       {
         "field":"query",
         "title":"Query"
      },
       {
         "field":"type",
         "title":"Type"
      },
      {
         "field":"icon",
         "title":"Icon"
      },
       {
         "field":"data",
         "title":"Data"
      },
      {
         "field":"scope",
         "title":"Scope"
      },
      {
         "field":"label",
         "title":"Label"
      },
      {
         "field":"description",
         "title":"Description"
      }
   ],
   "data": QueryUtils.read_querys(engine=engine)

  }



@Logger.catch
@router.get("/datastore/query/{queryid}")
async def read_query(queryid: str):
  return QueryUtils.read_query(queryid=queryid, engine=engine)

@Logger.catch
@router.delete("/datastore/query/{queryid}")
async def delete_query(queryid: str):
  return QueryUtils.delete_query(queryid=queryid, engine=engine)

## THEME

@Logger.catch
@router.post("/datastore/theme")
async def create_theme(body: ThemeModel):
  return ThemeUtils.create_theme(theme=body, engine=engine)

@Logger.catch
@router.put("/datastore/theme/{themeid}")
async def update_theme(themeid: str, body: ThemeModel):
  return ThemeUtils.update_theme(themeid=themeid, theme=body, engine=engine)

@Logger.catch
@router.get("/datastore/theme")
async def read_themes():
  return ThemeUtils.read_themes(engine=engine)

@Logger.catch
@router.get("/datastore/themes/cms") 
async def theme_list():
  return {
    "columns":[
      {
         "field":"projectid",
         "title":"Project Id"
      },
      {
         "field":"themeid",
         "title":"Theme Id"
      },
       {
         "field":"theme",
         "title":"Theme"
      },
       {
         "field":"type",
         "title":"Type"
      },
      {
         "field":"icon",
         "title":"Icon"
      },
      {
         "field":"scope",
         "title":"Scope"
      },
      {
         "field":"label",
         "title":"Label"
      },
      {
         "field":"description",
         "title":"Description"
      },
      {
         "field":"data",
         "title":"Data"
      }
      
   ],
   "data": ThemeUtils.read_themes(engine=engine)


  }


@Logger.catch
@router.get("/datastore/theme/{themeid}")
async def read_theme(themeid: str):
  return ThemeUtils.read_theme(themeid=themeid, engine=engine)

@Logger.catch
@router.delete("/datastore/theme/{themeid}")
async def delete_theme(themeid: str):
  return ThemeUtils.delete_theme(themeid=themeid, engine=engine)


## FLOW

@Logger.catch
@router.post("/datastore/flow")
async def create_flow(body: FlowModel):
  return FlowUtils.create_flow(theme=body, engine=engine)

@Logger.catch
@router.put("/datastore/flow")
async def update_flow(body: FlowModel):
  return FlowUtils.update_flow(theme=body, engine=engine)

@Logger.catch
@router.get("/datastore/flow")
async def read_flows():
  return FlowUtils.read_flows(engine=engine)

@Logger.catch
@router.get("/datastore/flow/{flowid}")
async def read_flow(flowid: str):
  return FlowUtils.read_flow(flowid=flowid, engine=engine)

@Logger.catch
@router.delete("/datastore/flow")
async def delete_flow(body: FlowModel):
  return FlowUtils.delete_flow(flow=body, engine=engine)


### GraphQL Interface for this datastore

@strawberry.type
class Query:

    @strawberry.field
    def project(self, projectid: str) -> ProjectModel:
      return ProjectUtils.read_project(projectid=projectid, engine=engine)

    @strawberry.field
    def connection(self, connectionid: str) -> ConnectionModel:
      return ConnectionUtils.read_connection(connectionid=connectionid, engine=engine)

    @strawberry.field
    def queries(self, queryid: str) -> QueryModel:
      return QueryUtils.read_query(queryid=queryid, engine=engine)

    @strawberry.field
    def theme(self, themeid: str) -> ThemeModel:
      return ThemeUtils.read_theme(themeid=themeid, engine=engine)

    @strawberry.field
    def flow(self, flowid: str) -> FlowModel:
      return FlowUtils.read_flow(flowid=flowid, engine=engine)

schema = strawberry.Schema(query=Query)

graphql_app = GraphQLRouter(schema)
router.add_route("/graphql", graphql_app)
router.add_api_websocket_route("/graphql", graphql_app, name='graphql_app')
