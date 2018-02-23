FROM ruby:latest

WORKDIR /app_tmp
COPY Gemfile /app_tmp
COPY Gemfile.lock /app_tmp

RUN bundle install

EXPOSE 4000

VOLUME /app
WORKDIR /app

RUN apt-get update && apt-get install -y net-tools

# Support future dated posts
CMD ["jekyll", "serve", "--future"]
