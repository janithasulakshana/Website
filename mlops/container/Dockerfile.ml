FROM python:3.12-slim

WORKDIR /app

COPY mlops/container/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY mlops/container /app/mlops/container

ENV PYTHONUNBUFFERED=1

CMD ["python", "mlops/container/runner.py", "--stage", "feature-engineering", "--use-case", "demand_forecasting"]
