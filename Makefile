REPORTER = spec

test-gengo:
		@./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			--ui gengojs-accept \
			tests/*.js

test-all: test-gengojs-accept

.PHONY: test-all