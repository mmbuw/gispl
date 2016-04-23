all: pdf

pdf:
	pandoc *.md metadata.yaml -o gispl.pdf --filter pandoc-fignos --filter pandoc-citeproc --latex-engine=xelatex --template=mytemplate.latex -N