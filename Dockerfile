FROM ruby:latest

COPY . /app_tmp

WORKDIR /app_tmp/blogs

RUN bundle install

EXPOSE 4000

VOLUME /app
WORKDIR /app/blogs

ENTRYPOINT jekyll serve
