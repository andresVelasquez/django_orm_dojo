class DojoRouter(object):
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'dojo':
            return 'dojo'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'dojo':
            return 'hammertime' # instead of putting None here which may still allow writing to DB because None just means "no suggestions on which DB to use" (but django will find it!), put this UNIQUE string which will not write and throw back a know error I can intercept in views
        return 'default'

# returning hammertime above to get an error has to be done after all the data is in the database. if database needs to be flushed and reloaded for some reason,
# it needs to be set back to 'dojo'. after data loaded, back to hammertime to use this read-only workaround
