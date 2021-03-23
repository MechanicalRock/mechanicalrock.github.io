FROM ruby:2.5.3

RUN apt-get update && apt-get install -y net-tools

WORKDIR /app_tmp
COPY Gemfile* ${WORKDIR}/

RUN bundle install

EXPOSE 4000

VOLUME /app
WORKDIR /app

# Support future dated posts
CMD ["jekyll", "serve", "--future", "--incremental"]
