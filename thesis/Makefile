all: pdf

pdf:
	pandoc *.md metadata.yaml -o complete.pdf --filter pandoc-citeproc --latex-engine=xelatex --template=mytemplate.latex -N