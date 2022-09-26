from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.asgi import GraphQL
from typing import Optional

@strawberry.type
class Connection(SQLModel, table=True):
    connectionid: str = Field(default=None, primary_key=True)
    projectid: Optional[str] = Field(default=None, index=True)
    scope: str = Field(index=True)
    icon: Optional[str] = Field(default=None, index=True)
    label: str = Field(index=True)
    database: str
    description: str
    host: str
    port: str
    type: str


class ConnectionUtils():

  def read_connection(self, connectionid: str, engine: any):
    with Session(engine) as session:
      statement = select(Connection).where(Connection.connectionid == connectionid)
      results = session.exec(statement)
      return results.first()

  def read_connections(self, engine: any):
    with Session(engine) as session:
      return session.exec(select(Connection)).all()

  def update_connection(self, connectionid: str, connection: Connection, engine: any):
    with Session(engine) as session:
      aconnection = self.read_connection(connectionid=connectionid, engine=engine)
      if aconnection:
        aconnection.connectionid = connection.connectionid
        aconnection.projectid = connection.projectid
        aconnection.scope = connection.scope
        aconnection.icon = connection.icon
        aconnection.label = connection.label
        aconnection.database = connection.database
        aconnection.description = connection.description
        aconnection.host = connection.host
        aconnection.port = connection.port
        aconnection.type = connection.type
        session.add(aconnection)
        session.commit()
        session.refresh(aconnection)

        return aconnection

      return aconnection

  def delete_connection(self, connectionid: str, engine: any):
    with Session(engine) as session:
      aconnection = self.read_connection(connectionid=connectionid, engine=engine)
      if aconnection:
        session.delete(aconnection)
        session.commit()
        return aconnection

      return aconnection

  def create_connection(self, connection: Connection, engine: any):
    with Session(engine) as session:
      aconnection = self.read_connection(connectionid=connection.connectionid, engine=engine)
      if aconnection:
        return aconnection

      session.add(connection)
      session.commit()
      session.refresh(connection)

      return connection

