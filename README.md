# django_orm_dojo
an app to help users practice queries using django's ORM syntax

Having recently graduated from Coding Dojo web development boot camp, I was looking for project ideas to add to my portfolio. I discussed it with an instructor who mentioned that students always had a tough time understanding Django's ORM and how to use it to query the database. She said it would be great if there were something like SQLZoo but for Django so maybe I could try writing that. Well, this is the result.

The app is written in Python 2.7 and Django 1.10. To make HTML tables from the database, I used the excellent djanjo-tables2:
https://github.com/bradleyayers/django-tables2

On the front-end it's just the usual suspects of HTML, CSS, JS with some JQuery thrown in there.

The data and questions based off the data came from another project that they currently use as an ORM assignment:
https://github.com/madjaqk/sports_orm.git

I currently have a deployed instance on EC2 (as of 3/28/2017). You can check it out at http://54.218.61.125/
