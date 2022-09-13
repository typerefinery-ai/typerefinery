from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.asgi import GraphQL
from typing import Optional

@strawberry.type
class Flow(SQLModel, table=True):
    flowid: str = Field(default=None, primary_key=True)
    projectid: Optional[str] = Field(default=None, index=True)
    scope: str = Field(index=True)
    icon: Optional[str] = Field(default=None, index=True)
    label: str = Field(index=True)
    description: str
    type: str
    data: str
    default: bool


class FlowUtils():

  def read_flow(self, flowid: str, engine: any):
    with Session(engine) as session:
      statement = select(Flow).where(Flow.flowid == flowid)
      results = session.exec(statement)
      return results.first()

  def read_flows(self, engine: any):
    with Session(engine) as session:
      return session.exec(select(Flow)).all()

  def update_flow(self, flowid: str, flow: Flow, engine: any):
    with Session(engine) as session:
      results = self.read_flow(flowid=flowid, engine=engine)
      aflow = results.one()
      if aflow:
        aflow.projectid = flow.projectid
        aflow.scope = flow.scope
        aflow.icon = flow.icon
        aflow.label = flow.label
        aflow.description = flow.description
        aflow.type = flow.type
        aflow.data = flow.data
        aflow.default = flow.default
        session.add(aflow)
        session.commit()
        session.refresh(aflow)

        return aflow

      return aflow

  def delete_flow(self, flowid: str, engine: any):
    with Session(engine) as session:
      results = self.read_flow(flowid=flowid, engine=engine)
      if results:
        aflow = results.one()
        session.delete(aflow)
        session.commit()
        return aflow

      return aflow

  def create_flow(self, flow: Flow, engine: any):
    with Session(engine) as session:
      aflow = self.read_flow(flowid=flow.flowid, engine=engine)
      if aflow:
        return aflow

      session.add(flow)
      session.commit()
      session.refresh(flow)

      return flow
