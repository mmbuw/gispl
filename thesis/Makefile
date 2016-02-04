all: pdf

pdf:
	pandoc *.md metadata.yaml -o complete.pdf --filter pandoc-citeproc --bibliography biblio.yaml --csl ieee.csl --latex-engine=xelatex --template=mytemplate.latex -N --toc