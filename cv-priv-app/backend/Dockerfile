FROM python:3.11-alpine

WORKDIR /app

ENV FLASK_APP=src/app.py
ENV FLASK_RUN_HOST=0.0.0.0

COPY pyproject.toml ./
COPY poetry.lock ./
RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

COPY . ./
EXPOSE 5000

CMD ["poetry", "run", "flask", "run"]