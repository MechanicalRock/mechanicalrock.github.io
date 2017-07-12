FROM ruby:latest

COPY . /app_tmp

WORKDIR /app_tmp

RUN bundle install

EXPOSE 4000

VOLUME /app
WORKDIR /app

ENTRYPOINT jekyll serve
