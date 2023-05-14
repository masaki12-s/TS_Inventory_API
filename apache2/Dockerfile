FROM httpd:2.4
# RUN a2enmod rewrite

COPY ./.digestpass /usr/local/apache2/conf/.digestpass
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./index.html /var/www/html/index.html
COPY ./secret.html /var/www/html/secret.html