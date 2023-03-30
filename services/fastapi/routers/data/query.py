from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.asgi import GraphQL
from typing import Optional

@strawberry.type
class Queries(SQLModel, table=True, tablename="query"):
    queryid: str = Field(default=None, primary_key=True)
    projectid: Optional[str] = Field(default=None, index=True)
    # removed connection dropdown from global query
    #connectionid: Optional[str] = Field(default=None, index=True)
    scope: str = Field(index=True)
    icon: Optional[str] = Field(default=None, index=True)
    label: str = Field(index=True)
    description: str
    type: str
    query: str
    data: str


class QueryUtils():

  def read_query(self, queryid: str, engine: any):
    with Session(engine) as session:
      statement = select(Queries).where(Queries.queryid == queryid)
      results = session.exec(statement)
      return results.first()

  def read_querys(self, engine: any):
    with Session(engine) as session:
      return session.exec(select(Queries)).all()

  def update_query(self, queryid: str, query: Queries, engine: any):
    with Session(engine) as session:
      aquery = self.read_query(queryid=queryid, engine=engine)
      if aquery:
        #aquery.connectionid = query.connectionid
        aquery.projectid = query.projectid
        aquery.scope = query.scope
        aquery.icon = query.icon
        aquery.label = query.label
        aquery.data = query.data
        aquery.description = query.description
        aquery.type = query.type
        aquery.query = query.query
        session.add(aquery)
        session.commit()
        session.refresh(aquery)

        return aquery

      return aquery

  def delete_query(self, queryid: str, engine: any):
    with Session(engine) as session:
      aquery = self.read_query(queryid=queryid, engine=engine)
      if aquery:
        session.delete(aquery)
        session.commit()
        return aquery

      return aquery

  def create_query(self, query: Queries, engine: any):
    with Session(engine) as session:
      aquery = self.read_query(queryid=query.queryid, engine=engine)
      if aquery:
        return aquery

      session.add(query)
      session.commit()
      session.refresh(query)

      return query
