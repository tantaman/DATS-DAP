# @author Matt Crinklaw-Vogt (tantaman)

require 'rake'

task :compile do
	system %{jison FilterParserJison.jison}
end

task :test do
	system %{node test/FilterParserTest.js}
end
