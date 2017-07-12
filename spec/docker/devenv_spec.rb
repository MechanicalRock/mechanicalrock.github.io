require 'spec_helper'
require 'docker'

describe "Development environment" do

  # $stderr.reopen("output/devenv_spec.log", "w")

  before(:all) do
    image = Docker::Image.build_from_dir('dev-env')do |v|
      if (log = JSON.parse(v)) && log.has_key?("stream")
        $stderr.puts log["stream"]
      end
    end

    set :os, family: :debian
    set :backend, :docker
    set :docker_image, image.id

  end

  describe "Installed Apps" do
    describe command('ruby --version') do
      its(:exit_status) {should eq 0}
      its(:stdout) { should include '2.4.1'}
    end

    describe package('serverspec') do
      it { should be_installed.by('gem') }
    end
    describe package('docker-api') do
      it { should be_installed.by('gem') }
    end
    describe package('bundler') do
      it { should be_installed.by('gem') }
    end
    describe package('jekyll') do
      it { should be_installed.by('gem') }
    end
  end

end
