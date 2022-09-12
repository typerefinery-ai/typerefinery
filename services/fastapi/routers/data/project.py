from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.asgi import GraphQL
from typing import Optional

@strawberry.type
class Project(SQLModel, table=True):
    projectid: str = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    icon: Optional[str] = Field(default=None, index=True)
    data: str

class ProjectUtils():

  def read_project(self, projectid: str, engine: any):
    with Session(engine) as session:
      statement = select(Project).where(Project.projectid == projectid)
      results = session.exec(statement)
      return results.first()

  def read_projects(self, engine: any):
    with Session(engine) as session:
      projects = session.exec(select(Project)).all()
      return projects

  def update_project(self, project: Project, engine: any):
    with Session(engine) as session:
      statement = select(Project).where(Project.projectid == project.projectid)
      results = session.exec(statement)
      project = results.one()
      if project:
        project.name = project.name
        project.description = project.description
        project.icon = project.icon
        project.data = project.data
        session.add(project)
        session.commit()
        session.refresh(project)

        return project

      return project

  def delete_project(self, projectid: str, engine: any):
    with Session(engine) as session:
      statement = select(Project).where(Project.projectid == projectid)
      results = session.exec(statement)
      if results:
        project = results.one()
        session.delete(project)
        session.commit()
        return project

      return project

  def create_project(self, project: Project, engine: any):
    with Session(engine) as session:
      aproject = self.read_project(projectid=project.projectid, engine=engine)
      if aproject:
        return aproject

      session.add(project)
      session.commit()
      session.refresh(project)

      return project
